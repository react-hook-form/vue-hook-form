// @ts-nocheck
import findRemovedFieldAndRemoveListener from './findRemovedFieldAndRemoveListener';
import isDetached from '../utils/isDetached';
import removeAllEventListeners from './removeAllEventListeners';

jest.mock('./removeAllEventListeners');
jest.mock('../utils/isDetached');

describe('findMissDomAndClean', () => {
  beforeEach(() => {
    jest.resetAllMocks();

    (isDetached as any).mockImplementation(() => {
      return true;
    });
  });

  describe('radio', () => {
    it('should return default fields value if nothing matches', () => {
      document.body.contains = jest.fn(() => true);
      const fields = {
        current: {
          test: 'test',
        },
      };
      expect(
        findRemovedFieldAndRemoveListener(
          fields as any,
          () => ({} as any),
          {
            ref: { name: 'bill', type: 'radio' },
          },
          {},
          true,
        ),
      ).toEqual(undefined);
    });

    it('should remove options completely if option found and no option left', () => {
      document.body.contains = jest.fn(() => false);

      const ref = document.createElement('input');
      ref.setAttribute('name', 'test');
      ref.setAttribute('type', 'radio');

      const disconnect = jest.fn();
      const fields = {
        current: {
          test: {
            name: 'test',
            ref,
            options: [
              {
                ref,
                mutationWatcher: {
                  disconnect,
                },
              },
            ],
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref,
        },
        {},
        true,
      );

      expect(fields).toEqual({
        current: {},
      });
    });

    it('should remove none radio field when found', () => {
      const ref = document.createElement('input');
      ref.setAttribute('name', 'test');
      ref.setAttribute('type', 'radio');
      document.body.contains = jest.fn(() => false);
      const disconnect = jest.fn();
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {},
            mutationWatcher: {
              disconnect,
            },
          },
          test1: {
            name: 'test',
            ref: {},
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref,
          mutationWatcher: {
            disconnect,
          },
        },
        {},
      );

      expect(fields).toMatchSnapshot();
    });

    it('should work for radio type input', () => {
      const ref = document.createElement('input');
      ref.setAttribute('name', 'test');
      ref.setAttribute('type', 'radio');
      document.body.contains = jest.fn(() => false);
      const disconnect = jest.fn();
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {},
            mutationWatcher: {
              disconnect,
            },
          },
          test1: {
            name: 'test',
            ref: {
              type: 'radio',
            },
          },
        },
      };

      expect(
        findRemovedFieldAndRemoveListener(
          fields,
          () => ({} as any),
          {
            ref: { name: 'test', type: 'radio' },
            options: [{ ref }],
            mutationWatcher: {
              disconnect,
            },
          },
          {},
        ),
      ).toMatchSnapshot();
    });

    it('should work for checkbox type input', () => {
      const ref = document.createElement('input');
      ref.setAttribute('name', 'test');
      ref.setAttribute('type', 'checkbox');
      document.body.contains = jest.fn(() => false);
      const disconnect = jest.fn();
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {},
            mutationWatcher: {
              disconnect,
            },
          },
          test1: {
            name: 'test',
            ref: {
              type: 'checkbox',
            },
          },
        },
      };

      expect(
        findRemovedFieldAndRemoveListener(
          fields,
          () => ({} as any),
          {
            ref: { name: 'test', type: 'checkbox' },
            options: [{ ref }],
            mutationWatcher: {
              disconnect,
            },
          },
          {},
        ),
      ).toMatchSnapshot();
    });

    it('should not delete field when option have value', () => {
      (isDetached as any).mockImplementation(() => {
        return false;
      });

      const fields = {
        current: {
          test: {
            name: 'test',
            type: 'radio',
            ref: {},
            options: [{ ref: { name: 'test', type: 'radio' } }],
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref: { name: 'test', type: 'radio' },
        },
        {},
      );

      expect(fields).toEqual({
        current: {
          test: {
            name: 'test',
            type: 'radio',
            ref: {},
            options: [{ ref: { name: 'test', type: 'radio' } }],
          },
        },
      });
    });

    it('should not remove event listener when type is not Element', () => {
      (isDetached as any).mockImplementation(() => {
        return false;
      });
      document.body.contains = jest.fn(() => false);

      const disconnect = jest.fn();
      const fields = {
        current: {
          test: {
            name: 'test',
            type: 'radio',
            ref: {},
            options: [
              {
                ref: 'test',
                mutationWatcher: {
                  disconnect,
                },
              },
            ],
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref: { name: 'test', type: 'text' },
          options: [
            {
              mutationWatcher: {
                disconnect,
              },
              ref: {},
            },
          ],
        },
        {},
      );

      expect(fields).toMatchSnapshot();

      expect(
        findRemovedFieldAndRemoveListener(
          fields,
          () => ({} as any),
          {
            ref: { name: 'test', type: 'text' },
          },
          {},
        ),
      ).toMatchSnapshot();
    });

    it('should remove options when force delete is set to true', () => {
      (isDetached as any).mockImplementation(() => {
        return false;
      });

      document.body.contains = jest.fn(() => false);

      const ref = document.createElement('input');
      ref.setAttribute('name', 'test');
      ref.setAttribute('type', 'radio');

      const disconnect = jest.fn();
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {},
            options: [],
          },
        },
      };
      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref: { name: 'test', type: 'radio' },
          options: [
            {
              mutationWatcher: {
                disconnect,
              },
              ref,
            },
          ],
        },
        {},
        false,
        true,
      );

      expect(fields).toEqual({
        current: {},
      });
    });
  });

  describe('text', () => {
    it('should delete field if type is text', () => {
      const mockWatcher = jest.fn();
      const state = { current: {} };
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {
              name: 'test',
              type: 'text',
              value: 'test',
            },
            mutationWatcher: {
              disconnect: mockWatcher,
            },
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        fields.current.test,
        state,
      );

      expect(state).toEqual({
        current: { test: 'test' },
      });
      expect(mockWatcher).toBeCalled();
      expect(fields).toEqual({
        current: {},
      });
    });

    it('should delete field if forceDelete is true', () => {
      (isDetached as any).mockReturnValue(false);
      const state = { current: {} };
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {
              name: 'test',
              type: 'text',
              value: 'test',
            },
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        fields.current.test,
        state,
        false,
        true,
      );

      expect(state).toEqual({
        current: { test: 'test' },
      });
      expect(removeAllEventListeners).toBeCalled();
      expect(fields).toEqual({
        current: {},
      });
    });

    it('should store state when component is getting unmount', () => {
      const state = { current: {} };
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {
              value: 'test',
            },
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref: { name: 'test', type: 'text' },
        },
        state,
        false,
      );

      expect(state).toEqual({
        current: { test: 'test' },
      });
    });

    it('should not store state when component is getting unmount and value is return undefined', () => {
      const state = { current: {} };
      const fields = {
        current: {
          test: {
            name: 'test',
            ref: {},
          },
        },
      };

      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref: { name: 'test', type: 'text' },
        },
        state,
        false,
      );

      expect(state).toEqual({
        current: {},
      });
    });
  });

  it('should not call mutation watcher when not available', () => {
    jest.spyOn(document.body, 'contains').mockReturnValue(false);

    const ref = document.createElement('input');
    ref.setAttribute('name', 'test');
    ref.setAttribute('type', 'radio');

    const fields = {
      current: {
        test: {
          name: 'test',
          ref,
          options: [
            {
              ref,
            },
          ],
        },
      },
    };

    expect(() => {
      findRemovedFieldAndRemoveListener(
        fields,
        () => ({} as any),
        {
          ref,
        },
        {},
        true,
      );
    }).not.toThrow();

    document.body.contains.mockRestore();
  });
});
