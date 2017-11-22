from neo4j.v1 import GraphDatabase, basic_auth
import os, json, time
import networkx as nx
from networkx.readwrite import json_graph

from queryManipulation import *

class Neo4jDatabase:

    def __init__(self):
        # connect to neo4j database
        self.driver = GraphDatabase.driver("bolt://localhost:7687", auth=basic_auth("python", "pyword"))
        self.session = self.driver.session()
        self.json_suffix = '_json'
        print('Connected to database.')

    def getQueries(self):
        label_string = 'MATCH (n) RETURN distinct labels(n) as labels'
        result = list(self.session.run(label_string))
        non_query_labels = ['Type', 'Concept', 'fail']
        labels = [l for r in result if not any(i in r['labels'] for i in non_query_labels) for l in r['labels']]
        queries = []
        for label in labels:
            if label[:7] == 'Query1_':
                label_string = 'MATCH (n:{}) '.format(label)
                where_string = "WHERE n.node_type='NAME.DISEASE' "
                return_string = "RETURN n.name as disease"
                result = list(self.session.run(label_string+where_string+return_string))
            elif label[:7] == 'Query2_':
                label_string = 'MATCH (n:{}) '.format(label)
                where_string1 = "WHERE n.node_type='NAME.DISEASE' "
                return_string1 = "WITH n.name as disease "
                where_string2 = "WHERE n.node_type='NAME.DRUG' "
                return_string2 = "RETURN n.name as drug, disease "
                query_string = label_string+where_string1+return_string1+label_string+where_string2+return_string2
                result = list(self.session.run(query_string))
            elif label[:7] == 'Query2a':
                label_string = 'MATCH (n:{}) '.format(label)
                where_string1 = "WHERE n.node_type='NAME.DISEASE' "
                return_string1 = "WITH n.name as phenotype "
                where_string2 = "WHERE n.node_type='NAME.DRUG' "
                return_string2 = "RETURN n.name as drug, phenotype "
                query_string = label_string+where_string1+return_string1+label_string+where_string2+return_string2
                result = list(self.session.run(query_string))
            query = {k:result[0][k] for k in result[0]}
            if 'disease' in query and query['disease'][:13] == 'NAME.DISEASE.':
                query['disease'] = query['disease'][13:]
            if 'phenotype' in query and query['phenotype'][:13] == 'NAME.DISEASE.':
                query['phenotype'] = query['phenotype'][13:]
            if 'drug' in query and query['drug'][:10] == 'NAME.DRUG.':
                query['drug'] = query['drug'][10:]
            query['type'] = label.split('_')[0]
            query['id'] = label
            queries += [query]
        return queries

    def getLabels(self):
        result = list(self.session.run('MATCH (n) RETURN distinct labels(n) as labels'))
        non_query_labels = ['Type', 'Concept', 'fail']
        labels = [l for r in result if not any(i in r['labels'] for i in non_query_labels) for l in r['labels']]
        return labels

    def getNodesByLabel(self, label):

        match_string = 'MATCH (n:{})'.format(label)
        return_string = 'RETURN [n{.*}] as nodes'
        query_string = ' '.join([match_string, return_string])
        result = list(self.session.run(query_string))
        match_string = 'MATCH (n:{})'.format(label)
        support_string = 'WITH collect(n) as nodes CALL apoc.path.subgraphAll(nodes, {maxLevel:0}) YIELD relationships as rels ' + \
            'UNWIND rels as r '
        return_string = 'RETURN [r{.*, start:startNode(r).id, end:endNode(r).id, type:type(r), id:id(r)}] as rels'
        query_string = ' '.join([match_string, support_string, return_string])
        result += list(self.session.run(query_string))

        return self.n2n(result)


    def query(self, input):
        if isinstance(input, str):
            # load query (as series of node and edge conditions) from json files
            # condition tuple format:
            # property name, comparison operator, property value, condition should be ____
            with open(os.path.join(input, 'query.json')) as infile:
                input = json.load(infile)

        if input[-1]['nodeSpecType'] == 'Named Node':
            query = addNameNodeToQuery(addNameNodeToQuery(input[::-1])[::-1])
        else:
            query = addNameNodeToQuery(input)

        # convert to list of nodes (with conditions) as edges with lengths
        nodes = [dict(n,**{'leadingEdge':query[i-1]['meta']})\
            if i>0 and query[i-1]['nodeSpecType']=='Unspecified Nodes'\
            else dict(n,**{'leadingEdge':{'numNodesMin':1,'numNodesMax':1}})\
            for i, n in enumerate(query)\
            if not n['nodeSpecType']=='Unspecified Nodes']

        node_count = len(nodes)
        edge_count = node_count-1

        # generate internal node and edge variable names
        node_names = ['n{:d}'.format(i) for i in range(node_count)]
        edge_names = ['r{0:d}{1:d}'.format(i,i+1) for i in range(edge_count)]

        # define bound nodes (no edges are bound)
        node_bound = [n['isBoundName'] for n in nodes]
        edge_bound = [False for e in range(edge_count)]

        node_conditions = []
        for n in nodes:
            node_conds = []
            if n['isBoundName']:
                node_conds += [[{'prop':'name', 'val':n['type']+'.'+n['label'], 'op':'=', 'cond':True},\
                    {'prop':'name', 'val':n['label'], 'op':'=', 'cond':True}]]
            if n['isBoundType']:
                node_conds += [[{'prop':'node_type', 'val':n['type'].replace(' ', ''), 'op':'=', 'cond':True}]]
            node_conditions += [node_conds]

        # generate MATCH command string to get paths of the appropriate size
        match_string = 'MATCH '+'({})-'.format(node_names[0])+'-'.join(['[{0}]-({1})'.format(edge_names[i], node_names[i+1]) for i in range(edge_count)])

        # generate WHERE command string to prune paths to those containing the desired nodes/node types
        node_conditions = [[[{k:(c[k] if k!='cond'\
            else '' if c[k]\
            else 'NOT ') for k in c}\
            for c in d]\
            for d in conds]
            for conds in node_conditions]
        node_cond_strings = ['('+' OR '.join(['{0}{1}.{2}{3}\'{4}\''.format(c['cond'], node_names[i], c['prop'], c['op'], c['val'])\
            for c in d])+')'\
            for i, conds in enumerate(node_conditions)\
            for d in conds]
        edge_cond_strings = ["(type({0})='Result' OR type({0})='Lookup')".format(r) for r in edge_names]
        where_string = 'WHERE '+' AND '.join(node_cond_strings + edge_cond_strings)

        # add bound fields and return map
        return_string = 'RETURN DISTINCT ['+', '.join(['{{id:{0}.id, bound:{1}}}'.format(n, 'True' if b else 'False') for n, b in zip(node_names, node_bound)])+'] as nodes'

        # return subgraphs matching query
        query_string = ' '.join([match_string, where_string, return_string])
        # print(query_string)
        
        print('Running query... ', end='')
        start = time.time()
        result = self.session.run(query_string)
        records = [r['nodes'] for r in result]
        print(time.time()-start, 'seconds elapsed')

        print("\n", len(records), "subgraphs returned.")

        return records

    def n2n(self, records):
        graph = nx.MultiDiGraph()
        for record in records:
            if 'nodes' in record:
                for node in record["nodes"]:
                    graph.add_node(node['id'], **node)
            if 'rels' in record:
                for edge in record["rels"]:
                    graph.add_edge(edge['start'], edge['end'], **edge)
            if 'supports' in record:
                for edge in record["supports"]:
                    graph.add_edge(edge['start'], edge['end'], **edge)
        return graph

    def neo4j2networkx(self, records):
        # parse neo4j output into networkx graphs
        subgraphs = []
        for record in records:
            subgraph = self.n2n([record])
            subgraphs += [subgraph]
        if len(subgraphs) > 0:
            G = subgraphs[0]
        else:
            G = nx.MultiDiGraph()

        for subgraph in subgraphs[1:]:
            G = nx.compose(G, subgraph)
        return G, subgraphs

    def __del__(self):
        self.session.close()
        print('Disconnected from database.')
