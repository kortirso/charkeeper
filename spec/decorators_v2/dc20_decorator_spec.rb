# frozen_string_literal: true

describe Dc20Decorator do
  subject(:decorator) { described_class.new.call(character: character_record) }

  let!(:character) { create(:dc20_character) }
  let!(:character_record) { Character.find(character.id) }

  before do
    create :character_bonus,
           bonusable: character,
           enabled: true,
           value: {
             'mig' => { 'type' => 'add', 'value' => 1 },
             'int' => { 'type' => 'add', 'value' => 2 },
             'initiative' => { 'type' => 'add', 'value' => 2 },
             'visions.dark' => { 'type' => 'set', 'value' => 10 },
             'damages' => { 'type' => 'concat', 'value' => ['cold', 'resist', 1] },
             'combat_expertise' => { 'type' => 'flat_concat', 'value' => %w[heavy_armor heavy_shield] }
           }

    torch = create :item,
                   modifiers: {
                     'speeds.swim' => { 'type' => 'set', 'value' => 0 },
                     'initiative' => { 'type' => 'set', 'value' => 'int + combat_mastery' },
                     'damages' => {
                       'type' => 'concat', 'value' => [%w[elemental resist half], %w[physical resist half]]
                     }
                   }

    create :character_item, character: character, item: torch, states: Character::Item.default_states.merge('hands' => 1)
  end

  it 'decorates character', :aggregate_failures do
    result = decorator

    expect(result.abilities['mig']).to eq 1
    expect(result.abilities['int']).to eq 1
    expect(result.modified_abilities['mig']).to eq 2
    expect(result.modified_abilities['int']).to eq 3
    expect(result.initiative).to eq 7
    expect(result.speeds['swim']).to eq 5
    expect(result.visions['dark']).to eq 10
    expect(result.damages['bludge']).to eq({ abs: 0, multi: 1 })
    expect(result.damages['cold']).to eq({ abs: 1, multi: 1 })
    expect(result.damages['poison']).to eq({ abs: 0, multi: 1 })
    expect(result.combat_expertise).to eq %w[heavy_armor heavy_shield]
  end
end
