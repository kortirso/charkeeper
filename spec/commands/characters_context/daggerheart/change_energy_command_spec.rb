# frozen_string_literal: true

describe CharactersContext::Daggerheart::ChangeEnergyCommand do
  subject(:command_call) { instance.call({ character: Daggerheart::Character.find(character.id), value: value }) }

  let(:instance) { described_class.new }
  let!(:character) {
    create :character, :daggerheart, data: {
      energy: { 'feature_1' => 1, 'feature_2' => 1, 'feature_3' => 1 }
    }
  }

  before do
    create :daggerheart_character_feature, :rally, slug: 'feature_1', limit_refresh: 'short_rest'
    create :daggerheart_character_feature, :rally, slug: 'feature_2', limit_refresh: 'long_rest'
    create :daggerheart_character_feature, :rally, slug: 'feature_3', limit_refresh: 'session'
  end

  context 'for short rest' do
    let(:value) { 'short' }

    it 'updates only short limit' do
      command_call

      expect(character.reload.data.energy).to eq({ 'feature_1' => 0, 'feature_2' => 1, 'feature_3' => 1 })
    end
  end

  context 'for long rest' do
    let(:value) { 'long' }

    it 'updates except session limit' do
      command_call

      expect(character.reload.data.energy).to eq({ 'feature_1' => 0, 'feature_2' => 0, 'feature_3' => 1 })
    end
  end

  context 'for session' do
    let(:value) { 'session' }

    it 'updates only session limit' do
      command_call

      expect(character.reload.data.energy).to eq({ 'feature_1' => 1, 'feature_2' => 1, 'feature_3' => 0 })
    end
  end
end
