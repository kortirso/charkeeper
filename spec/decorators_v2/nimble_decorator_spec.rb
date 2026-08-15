# frozen_string_literal: true

describe NimbleDecorator do
  subject(:decorator) { described_class.new.call(character: character_record) }

  let!(:character) { create :nimble_character }
  let!(:character_record) { Character.find(character.id) }

  before do
    create :character_bonus,
           bonusable: character,
           enabled: true,
           value: {
             'str' => { 'type' => 'add', 'value' => 1 },
             'int' => { 'type' => 'add', 'value' => 2 },
             'initiative' => { 'type' => 'add', 'value' => 2 }
           }

    torch = create :item,
                   modifiers: {
                     'speeds.swim' => { 'type' => 'set', 'value' => 0 },
                     'initiative' => { 'type' => 'set', 'value' => 'int' }
                   }

    create :character_item, character: character, item: torch, states: Character::Item.default_states.merge('hands' => 1)
  end

  it 'decorates character', :aggregate_failures do
    result = decorator

    expect(result.abilities['str']).to eq 2
    expect(result.abilities['int']).to eq 0
    expect(result.modified_abilities['str']).to eq 3
    expect(result.modified_abilities['int']).to eq 2
    expect(result.initiative).to eq 4
  end
end
