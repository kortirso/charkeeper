# frozen_string_literal: true

describe CharactersContext::Daggerheart::AddSpellCommand do
  subject(:command_call) {
    instance.call({ character: Daggerheart::Character.find(character.id), spell: Daggerheart::Feat.find(spell.id) }.compact)
  }

  let(:instance) { described_class.new }
  let!(:character) { create :character, :daggerheart }
  let!(:spell) { create :feat, :rally, :daggerheart }

  context 'without existing spell' do
    it 'adds spell', :aggregate_failures do
      expect { command_call }.to change(Daggerheart::Character::Feat, :count).by(1)
      expect(command_call[:errors_list]).to be_nil
    end
  end

  context 'with existing spell' do
    before { create :character_feat, character: character, feat: spell }

    it 'does not add spell', :aggregate_failures do
      expect { command_call }.not_to change(Daggerheart::Character::Feat, :count)
      expect(command_call[:errors_list]).to be_nil
    end
  end
end
