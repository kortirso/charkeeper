# frozen_string_literal: true

describe Dnd5Character::BaseDecorator do
  subject(:decorator) {
    described_class.new(Character.find(character.id))
  }

  let!(:character) { create :character }
  let!(:armor) { create :item, kind: 'armor', data: {}, info: { ac: 10, max_dex: 2 } }

  before do
    torch = create :item
    melee_weapon = create :item, kind: 'weapon', data: {}, info: { type: 'melee', caption: [] }
    thrown_weapon = create :item, kind: 'weapon', data: {}, info: { type: 'thrown', caption: [] }
    range_weapon = create :item, kind: 'weapon', data: {}, info: { type: 'range', caption: [] }

    create :character_item, character: character, item: torch
    create :character_item, character: character, item: melee_weapon
    create :character_item, character: character, item: thrown_weapon
    create :character_item, character: character, item: range_weapon
    create :character_item, character: character, item: armor, state: Character::Item::EQUIPMENT
  end

  it 'does not raise errors', :aggregate_failures do
    expect { decorator.id }.not_to raise_error
    expect(decorator.armor_class).to eq 12
  end

  context 'when armor does not have dex limit' do
    before do
      armor.info = { ac: 10 }
      armor.save
    end

    it 'does not raise errors', :aggregate_failures do
      expect { decorator.id }.not_to raise_error
      expect(decorator.armor_class).to eq 13
    end
  end
end
