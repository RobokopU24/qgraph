'''
Answer class
'''

import time
import json
import warnings
from sqlalchemy.types import ARRAY as Array
from sqlalchemy import Column, DateTime, String, Integer, Float, ForeignKey, func
from sqlalchemy.orm import relationship, backref

from setup import db

class AnswerSet(db.Model):
    '''
    An "answer" to a Question.
    Contains a ranked list of walks through the Knowledge Graph.
    '''

    __tablename__ = 'answer_set'
    id = Column(Integer, primary_key=True)
    # timestamp = Column(DateTime, default=func.now())
    timestamp = Column(String)
    filename = Column(String)
    question_hash = Column(String)

    def __init__(self, *args, **kwargs):
        self.id = None
        self.answers = []
        self.timestamp = time.strftime('%Y%m%d_%H%M%S')
        self.question_hash = None
        self.filename = None
        self.__idx = 0

        # apply json properties to existing attributes
        attributes = self.__dict__.keys()
        if args:
            struct = args[0]
            for key in struct:
                if key in attributes:
                    setattr(self, key, struct[key])
                else:
                    warnings.warn("JSON field {} ignored.".format(key))

        # override any json properties with the named ones
        for key in kwargs:
            if key in attributes:
                setattr(self, key, kwargs[key])
            else:
                warnings.warn("Keyword argument {} ignored.".format(key))

        db.session.add(self)
        db.session.commit()

    def __str__(self):
        return "<ROBOKOP Answer Set id={}>".format(self.id)

    def toJSON(self):
        keys = [str(column).split('.')[-1] for column in self.__table__.columns]
        struct = {key:getattr(self, key) for key in keys}
        return json.dumps(struct)

    def add(self, answer):
        '''
        Add an Answer to the AnswerSet
        '''

        if not isinstance(answer, Answer):
            raise ValueError("Only Answers may be added to AnswerSets.")

        self.answers += [answer]
        db.session.commit()
        return self

    def __iadd__(self, answer):
        return self.add(answer)

    def __getitem__(self, key):
        return self.answers[key]
        
    def __iter__(self):
        return self

    def __next__(self):
        if self.__idx >= len(self.answers):
            raise StopIteration
        else:
            self.__idx += 1
            return self.answers[self.__idx-1]

    def len(self):
        return len(self.answers)

class Answer(db.Model):
    '''
    Represents a single answer walk
    '''

    __tablename__ = 'answer'
    id = Column(Integer, primary_key=True)
    score = Column(Float)
    natural_answer = Column(String)
    answer_set_id = Column(Integer, ForeignKey('answer_set.id'))
    nodes = Column(Array(String))
    edges = Column(Array(String))

    # Use cascade='delete,all' to propagate the deletion of an AnswerSet onto its Answers
    answer_set = relationship(
        AnswerSet,
        backref=backref('answers',
                        uselist=True,
                        cascade='delete,all'))

    def __init__(self, *args, **kwargs):
        # initialize all attributes
        self.id = None # int
        self.answer_set = None # AnswerSet
        self.natural_answer = None # str
        self.nodes = [] # list of str
        self.edges = [] # list of str
        self.score = None # float

        # apply json properties to existing attributes
        attributes = self.__dict__.keys()
        if args:
            struct = args[0]
            for key in struct:
                if key in attributes:
                    setattr(self, key, struct[key])
                else:
                    warnings.warn("JSON field {} ignored.".format(key))

        # override any json properties with the named ones
        for key in kwargs:
            if key in attributes:
                setattr(self, key, kwargs[key])
            else:
                warnings.warn("Keyword argument {} ignored.".format(key))

    def __str__(self):
        return "<ROBOKOP Answer id={}>".format(self.id)

    def toJSON(self):
        keys = [str(column).split('.')[-1] for column in self.__table__.columns]
        struct = {key:getattr(self, key) for key in keys}
        return json.dumps(struct)

    def construct_name(self):
        ''' Construct short name summarizing each subgraph. '''
        names = []
        for node in self.nodes:
            names.append(node['name'])

        short_name = ''
        for name_idx, name in enumerate(names):
            if name_idx > 0:
                #short_name = short_name + '→'
                short_name = short_name + ' » '
            short_name = short_name + name[0:min(len(name), 4)]

        return short_name

def list_answersets():
    return db.session.query(AnswerSet).all()

def get_answerset_by_id(id):
    return db.session.query(AnswerSet).filter(AnswerSet.id == id).first()

def get_answersets_by_question_hash(hash):
    asets = db.session.query(AnswerSet)\
        .filter(AnswerSet.question_hash == hash)\
        .with_entities(AnswerSet.id, AnswerSet.timestamp)\
        .all()
    return [{"id":aset[0], "timestamp":aset[1]} for aset in asets]