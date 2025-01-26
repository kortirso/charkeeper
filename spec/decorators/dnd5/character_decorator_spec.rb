# frozen_string_literal: true

describe Dnd5::CharacterDecorator do
  subject(:decorate) { described_class.new(data: dnd5_character).decorate }

  let!(:dnd5_character) { create :dnd5_character, selected_skills: %w[history] }

  before do
    torch = create :dnd5_item
    melee_weapon = create :dnd5_item, kind: 'light weapon', data: { type: 'melee', caption: [] }
    thrown_weapon = create :dnd5_item, kind: 'light weapon', data: { type: 'thrown', caption: [] }
    range_weapon = create :dnd5_item, kind: 'light weapon', data: { type: 'range', caption: [] }
    armor = create :dnd5_item, kind: 'light armor', data: { ac: 10 }

    create :dnd5_character_item, character: dnd5_character, item: torch
    create :dnd5_character_item, character: dnd5_character, item: melee_weapon
    create :dnd5_character_item, character: dnd5_character, item: thrown_weapon
    create :dnd5_character_item, character: dnd5_character, item: range_weapon
    create :dnd5_character_item, character: dnd5_character, item: armor, ready_to_use: true
  end

  it 'returns hash with decorated data of character', :aggregate_failures do
    expect { decorate }.not_to raise_error
    expect(decorate.is_a?(Hash)).to be_truthy
  end
end
