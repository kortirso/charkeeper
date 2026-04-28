# frozen_string_literal: true

describe CharactersContext::Cosmere::UpdateCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :cosmere }

  context 'when change level' do
    let(:params) { { character: Cosmere::Character.find(character.id), level: 2 } }

    it 'updates character', :aggregate_failures do
      command_call

      expect(character.reload.data.level).to eq 2
      expect(character.data.health_max).to eq 15
    end
  end

  context 'when change str' do
    let(:params) {
      { character: Cosmere::Character.find(character.id), abilities: { str: 1, spd: 0, int: 0, wil: 0, awa: 0, pre: 0 } }
    }

    it 'updates character', :aggregate_failures do
      command_call

      expect(character.reload.data.level).to eq 1
      expect(character.data.health_max).to eq 11
    end
  end
end
