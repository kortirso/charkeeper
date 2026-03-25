# frozen_string_literal: true

describe CharactersContext::Dnd2024::Talents::AddCommand do
  subject(:command_call) { instance.call(params) }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :dnd2024 }
  let!(:feat) { create :feat, :dnd2024 }

  context 'when additional is present' do
    let(:params) {
      { character: Character.find(character.id), talent: Feat.find(feat.id), additional: true }
    }

    it 'updates talents', :aggregate_failures do
      expect { command_call }.to change(Character::Feat, :count).by(1)
      expect(character.reload.data.selected_talents).to eq({ feat.id => 1 })
      expect(character.data.selected_additional_talents).to eq 1
    end
  end
end
