# frozen_string_literal: true

describe CharactersContext::Daggerheart::RefreshFeats do
  subject(:service_call) { described_class.new.call(character: Daggerheart::Character.find(character.id)) }

  let!(:feat) { create :feat, :rally }
  let!(:character) { create :character, :daggerheart }

  it 'attaches feats to character' do
    expect { service_call }.to change(character.feats, :count).by(1)
  end

  context 'with existing attached feat' do
    before { create :character_feat, character: character, feat: feat }

    it 'does not attach feats to character' do
      expect { service_call }.not_to change(character.feats, :count)
    end
  end
end
