# frozen_string_literal: true

describe CharactersContext::Daggerheart::ChangeEnergyCommand do
  subject(:command_call) do
    instance.call(
      {
        character: Daggerheart::Character.find(character.id),
        value: value,
        options: options,
        make_rolls: make_rolls
      }.compact
    )
  end

  let(:instance) { described_class.new }
  let(:options) { nil }
  let(:make_rolls) { false }
  let!(:character) { create :character, :daggerheart }
  let!(:feat1) { create :feat, :rally }
  let!(:feat2) { create :feat, :rally }
  let!(:feat3) { create :feat, :rally }
  let!(:character_feat1) { create :character_feat, character: character, feat: feat1, used_count: 1, limit_refresh: 0 }
  let!(:character_feat2) { create :character_feat, character: character, feat: feat2, used_count: 1, limit_refresh: 1 }
  let!(:character_feat3) { create :character_feat, character: character, feat: feat3, used_count: 1, limit_refresh: 2 }

  before do
    character.data.to_h.merge!({ 'health_marked' => 3, 'stress_marked' => 4, 'spent_armor_slots' => 2, 'hope_marked' => 1 })
    character.save
  end

  context 'for short rest' do
    let(:value) { 'short' }

    it 'updates only short limit', :aggregate_failures do
      command_call

      expect(character_feat1.reload.used_count).to eq 0
      expect(character_feat2.reload.used_count).to eq 1
      expect(character_feat3.reload.used_count).to eq 1
    end

    context 'with making rolls' do
      let(:make_rolls) { true }
      let(:options) { { clear_health: 1, clear_stress: 1, clear_armor_slots: 0, gain_hope: 0, gain_double_hope: 0 } }

      it 'updates only short limit', :aggregate_failures do
        command_call

        expect(character_feat1.reload.used_count).to eq 0
        expect(character_feat2.reload.used_count).to eq 1
        expect(character_feat3.reload.used_count).to eq 1
        expect(character.reload.data.health_marked).not_to eq 3
        expect(character.data.stress_marked).not_to eq 4
        expect(character.data.spent_armor_slots).to eq 2
      end
    end
  end

  context 'for long rest' do
    let(:value) { 'long' }
    let(:options) { { clear_health: 1, clear_stress: 1, clear_armor_slots: 0, gain_hope: 0, gain_double_hope: 0 } }

    it 'updates except session limit', :aggregate_failures do
      command_call

      expect(character_feat1.reload.used_count).to eq 0
      expect(character_feat2.reload.used_count).to eq 0
      expect(character_feat3.reload.used_count).to eq 1
      expect(character.reload.data.health_marked).to eq 0
      expect(character.data.stress_marked).to eq 0
      expect(character.data.spent_armor_slots).to eq 2
    end

    context 'with updating hope' do
      let(:options) { { clear_health: 0, clear_stress: 0, clear_armor_slots: 0, gain_hope: 1, gain_double_hope: 1 } }

      it 'updates except session limit', :aggregate_failures do
        command_call

        expect(character_feat1.reload.used_count).to eq 0
        expect(character_feat2.reload.used_count).to eq 0
        expect(character_feat3.reload.used_count).to eq 1
        expect(character.reload.data.health_marked).to eq 3
        expect(character.data.stress_marked).to eq 4
        expect(character.data.spent_armor_slots).to eq 2
        expect(character.data.hope_marked).to eq 4
      end
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
