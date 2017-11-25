'use strict';

const expect = require('chai').expect;
const TeamspeakQuery = require('..');

let testString = 'notifytextmessage targetmode=3 msg=x=y=z invokerid=2 invokername=schroffl invokeruid=3ZLOUe2rnjkorZfn98EdKyadVV4=';

describe('TeamspeakQuery', () => {

  describe('#escape', () => {
    it('Should escape strings according to the specs', () => {
      expect( TeamspeakQuery.escape('\\') ).to.equal('\\\\');
      expect( TeamspeakQuery.escape('/')  ).to.equal('\\/');
      expect( TeamspeakQuery.escape(' ')  ).to.equal('\\s');
      expect( TeamspeakQuery.escape('\n') ).to.equal('\\n');
      expect( TeamspeakQuery.escape('\r') ).to.equal('\\r');
      expect( TeamspeakQuery.escape('\t') ).to.equal('\\t');
      expect( TeamspeakQuery.escape('\v') ).to.equal('\\v');
      expect( TeamspeakQuery.escape('\f') ).to.equal('\\f');
    });
  });

  describe('#unescape', () => {
    it('Should unescape strings according to the specs', () => {
      expect( TeamspeakQuery.unescape('\\\\') ).to.equal('\\');
      expect( TeamspeakQuery.unescape('\\/')  ).to.equal('/');
      expect( TeamspeakQuery.unescape('\\s')  ).to.equal(' ');
      expect( TeamspeakQuery.unescape('\\n')  ).to.equal('\n');
      expect( TeamspeakQuery.unescape('\\r')  ).to.equal('\r');
      expect( TeamspeakQuery.unescape('\\t')  ).to.equal('\t');
      expect( TeamspeakQuery.unescape('\\v')  ).to.equal('\v');
      expect( TeamspeakQuery.unescape('\\f')  ).to.equal('\f');
    });
  });

  describe('#assembleCommandString', () => {
    it('Should correctly construct and escape a command string', () => {
      expect( TeamspeakQuery.assembleCommandString('command', { 'this': 'is' }, 'just', { 'msg': 'a stupid test' }) )
      .to.equal('command this=is just msg=a\\sstupid\\stest');
    });
  });

  describe('#parse', () => {
    it('Should detect error- and notify-messages', () => {
      let notify = TeamspeakQuery.parse('notifytextmessage msg=text'),
          error = TeamspeakQuery.parse('error id=0 msg=ok');

      expect(notify.type).to.equal('notifytextmessage');
      expect(notify.params.msg).to.equal('text');

      expect(error.type).to.equal('error');
      expect(error.params.msg).to.equal('ok');
    });

    it('Should parse multiple values for the same key into an array', () => {
      let str = 'clid=1|clid=2',
          parsed = TeamspeakQuery.parse(str);

      expect(parsed.type).to.equal(null);
      expect(parsed.params.clid).to.be.a('array');
    });

    it('Should not fail when an equal sign is in a parameter', () => {
      let str = 'notifytextmessage msg=x=y=z invokername=This\\s=\\smy\\pname',
          parsed = TeamspeakQuery.parse(str);

      expect(parsed.type).to.equal('notifytextmessage');
      expect(parsed.params.msg).to.equal('x=y=z');
      expect(parsed.params.invokername).to.equal('This = my|name');
    });
  });

});