# frozen_string_literal: true

describe Dnd5Character::BaseDecorator do
  subject(:decorator) {
    described_class.new(Character.find(character.id))
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

  it 'does not raise errors' do
    expect { decorator.id }.not_to raise_error
  end
end
