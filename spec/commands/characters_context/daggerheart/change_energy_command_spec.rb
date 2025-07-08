# frozen_string_literal: true

describe CharactersContext::Daggerheart::ChangeEnergyCommand do
  subject(:command_call) { instance.call({ character: Daggerheart::Character.find(character.id), value: value }) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :daggerheart }
  let!(:feat1) { create :feat, :rally }
  let!(:feat2) { create :feat, :rally }
  let!(:feat3) { create :feat, :rally }
  let!(:character_feat1) { create :character_feat, character: character, feat: feat1, used_count: 1, limit_refresh: 0 }
  let!(:character_feat2) { create :character_feat, character: character, feat: feat2, used_count: 1, limit_refresh: 1 }
  let!(:character_feat3) { create :character_feat, character: character, feat: feat3, used_count: 1, limit_refresh: 2 }

  context 'for short rest' do
    let(:value) { 'short' }

    it 'updates only short limit', :aggregate_failures do
      command_call

      expect(character_feat1.reload.used_count).to eq 0
      expect(character_feat2.reload.used_count).to eq 1
      expect(character_feat3.reload.used_count).to eq 1
    end
  end

  context 'for long rest' do
    let(:value) { 'long' }

    it 'updates except session limit', :aggregate_failures do
      command_call

      expect(character_feat1.reload.used_count).to eq 0
      expect(character_feat2.reload.used_count).to eq 0
      expect(character_feat3.reload.used_count).to eq 1
    end
  end

  context 'for session' do
    let(:value) { 'session' }

    it 'updates only session limit', :aggregate_failures do
      command_call

      expect(character_feat1.reload.used_count).to eq 1
      expect(character_feat2.reload.used_count).to eq 1
      expect(character_feat3.reload.used_count).to eq 0
    end
  end
end
