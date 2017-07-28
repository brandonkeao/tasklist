import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { mockNetworkInterfaceWithSchema } from 'apollo-test-utils';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { MemoryRouter } from 'react-router';

import App from './App';

import typeDefs from '../schema';

const schema = makeExecutableSchema({ typeDefs });

const mockTasks = {
  // Set by the tests below
  pinned: [],
  inbox: [],
};
const mocks = {
  Query: () => ({
    me: () => {
      return {
        tasks(_, { state }) {
          return state === 'TASK_PINNED' ? mockTasks.pinned : mockTasks.inbox;
        },
      };
    },
  }),
  Mutation: () => ({
    updateTask: action('updateTask'),
  }),
};
addMockFunctionsToSchema({
  schema,
  mocks,
});

const pinnedTasks = [
  buildTask({ state: 'TASK_PINNED' }),
  buildTask({ state: 'TASK_PINNED' }),
  buildTask({ state: 'TASK_PINNED' }),
];

const inboxTasks = [
  buildTask({ state: 'TASK_INBOX' }),
  buildTask({ state: 'TASK_INBOX' }),
  buildTask({ state: 'TASK_INBOX' }),
];

function buildTask(attributes) {
  return {
    id: Math.round(Math.random() * 1000000).toString(),
    title: 'Test Task',
    subtitle: 'on Test Board',
    url: 'http://test.url',
    subtitle_url: 'http://test2.url',
    ...attributes,
  };
}

/* We could build out (or share) the mocked provider as for the InboxScreen.story */
const mockNetworkInterface = mockNetworkInterfaceWithSchema({ schema });

const client = new ApolloClient({
  networkInterface: mockNetworkInterface,
});

function MockedProvider({ children }) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

storiesOf('App', module)
  .addDecorator(story => (
    <MockedProvider>
      <MemoryRouter initialEntries={['/']}>{story()}</MemoryRouter>
    </MockedProvider>
  ))
  .add('homepage', () => {
    mockTasks.inbox = inboxTasks;
    mockTasks.pinned = pinnedTasks;
    return <App/>;
  });
