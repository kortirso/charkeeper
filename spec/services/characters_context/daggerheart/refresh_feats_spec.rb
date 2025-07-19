# frozen_string_literal: true

describe CharactersContext::Daggerheart::RefreshFeats do
  subject(:service_call) { described_class.new.call(character: Daggerheart::Character.find(character.id)) }

  let!(:feat1) { create :feat, :rally }
  let!(:feat2) { create :feat, :rally }
  let!(:feat3) { create :feat, :rally, exclude: [feat1.slug] }
  let!(:character) { create :character, :daggerheart }

  before do
    create :feat, :rally, origin: 3, origin_value: 'wordsmith', conditions: { subclass_mastery: 3 }

    create :character_feat, feat: feat1, character: character
    create :character_feat, feat: feat2, character: character
  end

  it 'attaches feats to character' do
    service_call

    expect(character.feats.pluck(:feat_id)).to contain_exactly(feat2.id, feat3.id)
  end
end
