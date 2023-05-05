import { html, TemplateResult } from 'lit';
import '../src/word-tiles.js';

export default {
  title: 'WordTiles',
  component: 'word-tiles',
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

interface Story<T> {
  (args: T): TemplateResult;
  args?: Partial<T>;
  argTypes?: Record<string, unknown>;
}

interface ArgTypes {
  title?: string;
  backgroundColor?: string;
}

const Template: Story<ArgTypes> = ({ title, backgroundColor = 'white' }: ArgTypes) => html`
  <word-tiles style="--word-tiles-background-color: ${backgroundColor}" .title=${title}></word-tiles>
`;

export const App = Template.bind({});
App.args = {
  title: 'My app',
};
