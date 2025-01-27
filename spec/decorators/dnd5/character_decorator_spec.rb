# frozen_string_literal: true

describe Dnd5::CharacterDecorator do
  subject(:decorate) {
    described_class.new(character: Character.find(character.id)).decorate
  }

  let!(:character) { create :character }

  before do
    torch = create :item
    melee_weapon = create :item, data: { kind: 'light weapon', info: { type: 'melee', caption: [] } }
    thrown_weapon = create :item, data: { kind: 'light weapon', info: { type: 'thrown', caption: [] } }
    range_weapon = create :item, data: { kind: 'light weapon', info: { type: 'range', caption: [] } }
    armor = create :item, data: { kind: 'light armor', info: { ac: 10 } }

    create :character_item, character: character, item: torch
    create :character_item, character: character, item: melee_weapon
    create :character_item, character: character, item: thrown_weapon
    create :character_item, character: character, item: range_weapon
    create :character_item, character: character, item: armor, data: { ready_to_use: true }
  end

  it 'returns hash with decorated data of character', :aggregate_failures do
    expect { decorate }.not_to raise_error
    expect(decorate.is_a?(Hash)).to be_truthy
  end
end
