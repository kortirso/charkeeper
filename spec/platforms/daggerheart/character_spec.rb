# frozen_string_literal: true

describe Daggerheart::Character do
  let!(:character) { create :character, :daggerheart }

  describe '#decorator' do
    subject(:decorator) { described_class.find(character.id).decorator }

    before do
      torch = create :item, type: 'Daggerheart::Item'
      primary_weapon = create :item, type: 'Daggerheart::Item', kind: 'primary weapon', info: { trait: 'agi', bonuses: {} }
      secondary_weapon = create :item, type: 'Daggerheart::Item', kind: 'secondary weapon', info: { trait: 'agi', bonuses: {} }
      armor = create :item, type: 'Daggerheart::Item', kind: 'light armor', info: { bonuses: {} }

      create :character_item, character: character, item: torch
      create :character_item, character: character, item: primary_weapon, ready_to_use: true
      create :character_item, character: character, item: secondary_weapon, ready_to_use: true
      create :character_item, character: character, item: armor, ready_to_use: true

      create :daggerheart_character_feature, :rally
    end

    it 'calculates everything without errors', :aggregate_failures do
      expect(decorator.id).to eq character.id
      expect(decorator.features.size).to eq 1
      expect(decorator.features.dig(0, :slug)).to eq 'rally-1'
      expect(decorator.attacks).not_to be_nil
    end
  end

  describe '#config' do
    it 'returns config data', :aggregate_failures do
      expect(described_class.config).not_to be_nil
      expect(described_class.heritages).not_to be_nil
      expect(described_class.heritage_info('dwarf')).not_to be_nil
      expect(described_class.classes_info).not_to be_nil
      expect(described_class.class_info('bard')).not_to be_nil
      expect(described_class.subclasses_info('bard')).not_to be_nil
      expect(described_class.communities).not_to be_nil
    end
  end
end
