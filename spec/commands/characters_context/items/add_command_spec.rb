# frozen_string_literal: true

describe CharactersContext::Items::AddCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character }
  let!(:item) { create :item }

  context 'without name and modifiers' do
    let(:params) { { character: character, item: item } }

    it 'adds item' do
      expect { command_call }.to change(Character::Item, :count).by(1)
    end

    context 'with existing item in backpack' do
      let!(:character_item) { create :character_item, character: character, item: item, states: { 'backpack' => 1 } }

      it 'adds item', :aggregate_failures do
        expect { command_call }.not_to change(Character::Item, :count)
        expect(character_item.reload.states['backpack']).to eq 2
        expect(character_item.states.values.sum).to eq 2
      end
    end

    context 'with existing item not in backpack' do
      let!(:character_item) { create :character_item, character: character, item: item, states: { 'hands' => 1 } }

      it 'adds item', :aggregate_failures do
        expect { command_call }.not_to change(Character::Item, :count)
        expect(character_item.reload.states['backpack']).to eq 1
        expect(character_item.states.values.sum).to eq 2
      end
    end

    context 'with existing custom item' do
      let!(:character_item) do
        create :character_item, character: character, item: item, states: { 'hands' => 1 }, name: 'Топор +1'
      end

      it 'adds item', :aggregate_failures do
        expect { command_call }.to change(Character::Item, :count).by(1)
        expect(character_item.reload.states['hands']).to eq 1
        expect(character_item.states.values.sum).to eq 1
      end
    end
  end

  context 'with name and modifiers' do
    let(:params) do
      { character: character, item: item, name: 'Топор +1', modifiers: { 'str' => { 'type' => 'add', 'value' => 1 } } }
    end

    it 'adds item' do
      expect { command_call }.to change(Character::Item, :count).by(1)
    end

    context 'with existing item in backpack' do
      let!(:character_item) { create :character_item, character: character, item: item, states: { 'backpack' => 1 } }

      it 'adds item', :aggregate_failures do
        expect { command_call }.to change(Character::Item, :count).by(1)
        expect(character_item.reload.states['backpack']).to eq 1
        expect(character_item.states.values.sum).to eq 1
      end
    end

    context 'with existing item not in backpack' do
      let!(:character_item) { create :character_item, character: character, item: item, states: { 'hands' => 1 } }

      it 'adds item', :aggregate_failures do
        expect { command_call }.to change(Character::Item, :count).by(1)
        expect(character_item.reload.states['hands']).to eq 1
        expect(character_item.states.values.sum).to eq 1
      end
    end
  end
end
