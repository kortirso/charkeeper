# frozen_string_literal: true

describe Dnd2024::Character do
  let!(:character) { create :character, :bard, :dnd2024 }

  describe '#decorator' do
    subject(:decorator) { described_class.find(character.id).decorator }

    before do
      torch = create :item, type: 'Dnd2024::Item'
      melee_weapon = create :item, type: 'Dnd2024::Item', kind: 'light weapon', info: { type: 'melee', caption: [] }
      thrown_weapon = create :item, type: 'Dnd2024::Item', kind: 'light weapon', info: { type: 'thrown', caption: [] }
      range_weapon = create :item, type: 'Dnd2024::Item', kind: 'light weapon', info: { type: 'range', caption: [] }
      armor = create :item, type: 'Dnd2024::Item', kind: 'light armor', info: { ac: 10 }

      create :character_item, character: character, item: torch
      create :character_item, character: character, item: melee_weapon
      create :character_item, character: character, item: thrown_weapon
      create :character_item, character: character, item: range_weapon
      create :character_item, character: character, item: armor, ready_to_use: true

      feat = create :feat, :dnd2024_bardic_inspiration
      create :character_feat, feat: feat, character: character
    end

    it 'calculates everything without errors', :aggregate_failures do
      expect(decorator.id).to eq character.id
      expect(decorator.features.size).to eq 1
      expect(decorator.features.dig(0, :slug)).to eq 'bardic_inspiration'
      expect(decorator.class_save_dc).to eq %w[dex cha]
      expect(decorator.spell_classes[:bard]).not_to be_nil
      expect(decorator.spells_slots).not_to be_nil
      expect(decorator.attacks).not_to be_nil
      expect(decorator.attacks_per_action).not_to be_nil
      expect(decorator.armor_class).not_to be_nil
    end
  end
end
