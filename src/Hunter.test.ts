import * as Immutable from 'immutable';
import {ApiError} from './errors/ApiError';
import {Hunter} from './Hunter';

describe('Hunter', () => {
  const fetchMock = require('fetch-mock');
  const url = 'http://www.test.com/graphql';

  describe('#toGQL', () => {
    it('should convert a string to GQL', () => {
      const str: string = 'test';
      const gql: string = Hunter.toGQL(str);
      return expect('"test"').toBe(gql);
    });

    it('should convert a number to GQL', () => {
      const num: number = 123;
      const gql: string = Hunter.toGQL(num);
      return expect(123).toBe(gql);
    });

    it('should convert a JSON object to GQL', () => {
      const obj: object = {prop: 'test'};
      const gql: string = Hunter.toGQL(obj);
      return expect('{prop: "test"}').toBe(gql);
    });

    it('should convert an array to GQL', () => {
      const array: object[] = [{prop: 'test'}];
      const gql: string = Hunter.toGQL(array);
      return expect('[{prop: "test"}]').toBe(gql);
    });

    it('should convert an immutable object to GQL', () => {
      const obj: Iterable<any> = Immutable.fromJS({prop: 'test'});
      const gql: string = Hunter.toGQL(obj);
      return expect('{prop: "test"}').toBe(gql);
    });
  });

  describe('#query', () => {
    const gql: string = '{ app { ping } }';
    const data: object = {hello: 'world'};
    const errors: Error[] = [{name: 'Test Error', message: 'test_error'}];

    it('should get a successful response from a query', (done) => {
      fetchMock.postOnce(url, {
        body: {data},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      Hunter.query(url, gql)
        .then((results) => {
          expect(results.hello).toBe('world');
          done();
        })
        .catch(done);
    });

    it('should send a token', (done) => {
      const token: string = 'test_token';
      fetchMock.postOnce(url, {
        body: {data},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      Hunter.query(url, gql, {token})
        .then(() => {
          const opts = fetchMock.lastOptions();
          expect(opts.headers.Authorization).toBe(`Bearer ${token}`);
          done();
        })
        .catch(done);
    });

    it('should get an error from a query', (done) => {
      fetchMock.postOnce(url, {
        body: {errors},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      Hunter.query(url, gql)
        .then(() => {
          expect(false).toBe(true);
          done();
        })
        .catch((error: ApiError) => {
          expect(error.errors[0]).toBe('test_error');
          done();
        });
    });

    it('should emit an error event', (done) => {
      fetchMock.postOnce(url, {
        body: {errors},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      const spy: jest.Mock<any> = jest.fn();
      Hunter.on('rip_hunter_error', spy);

      Hunter.query(url, gql)
        .then(() => {
          expect(false).toBe(true);
          done();
        })
        .catch(() => {
          expect(spy.mock.calls.length).toBe(1);
          done();
        });
    });
  });

  describe('#mutation', () => {
    const gql: string = '{ app { ping } }';
    const data: object = {hello: 'world'};
    const errors: Error[] = [{name: 'Test Error', message: 'test_error'}];

    it('should get a successful response from a query', (done) => {
      fetchMock.postOnce(url, {
        body: {data},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      Hunter.mutation(url, gql)
        .then((results) => {
          expect(results.hello).toBe('world');
          done();
        })
        .catch(done);
    });

    it('should send a token', (done) => {
      const token: string = 'test_token';
      fetchMock.postOnce(url, {
        body: {data},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      Hunter.mutation(url, gql, {token})
        .then(() => {
          const opts = fetchMock.lastOptions();
          expect(opts.headers.Authorization).toBe(`Bearer ${token}`);
          done();
        })
        .catch(done);
    });

    it('should get an error from a query', (done) => {
      fetchMock.postOnce(url, {
        body: {errors},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      Hunter.mutation(url, gql)
        .then(() => {
          expect(false).toBe(true);
          done();
        })
        .catch((error: ApiError) => {
          expect(error.errors[0]).toBe('test_error');
          done();
        });
    });

    it('should emit an error event', (done) => {
      fetchMock.postOnce(url, {
        body: {errors},
        headers: {'Content-Type': 'application/json'},
        sendAsJson: true,
        status: 200
      });

      const spy: jest.Mock<any> = jest.fn();
      Hunter.on('rip_hunter_error', spy);

      Hunter.mutation(url, gql)
        .then(() => {
          expect(false).toBe(true);
          done();
        })
        .catch(() => {
          expect(spy.mock.calls.length).toBe(1);
          done();
        });
    });
  });

  describe('#removeSpaces', () => {
    it('should remove extra spacing except within quotes', () => {
      const str: string = 'test{ method: {id: "hello world"}';
      expect(Hunter.removeSpaces(str)).toBe('test{method:{id:"hello world"}');
    });
  });
});
