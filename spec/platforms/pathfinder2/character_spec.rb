# frozen_string_literal: true

describe Pathfinder2::Character do
  describe '#config' do
    it 'returns config data', :aggregate_failures do
      expect(described_class.config).not_to be_nil
      expect(described_class.races).not_to be_nil
      expect(described_class.race_info('dwarf')).not_to be_nil
      expect(described_class.subraces('dwarf')).not_to be_nil
      expect(described_class.classes_info).not_to be_nil
      expect(described_class.class_info('witch')).not_to be_nil
      expect(described_class.main_ability_options('witch')).not_to be_nil
      expect(described_class.backgrounds).not_to be_nil
    end
  end
end
