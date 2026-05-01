# frozen_string_literal: true

describe CharactersContext::Dnd5::RefreshFeats do
  subject(:service_call) { described_class.new.call(character: Dnd5::Character.find(character.id)) }

  let!(:feat1) { create :feat, :rally, :dnd5 }
  let!(:feat2) { create :feat, :rally, :dnd5, limit_refresh: 0 }
  let!(:feat3) { create :feat, :rally, :dnd5, exclude: [feat1.slug], limit_refresh: 0 }
  let!(:feat4) { create :feat, :rally, :dnd5, conditions: { selected_feats: ['something'] }, limit_refresh: 1 }
  let!(:character) { create :character, :bard }

  before do
    create :feat, :rally, origin: 2, origin_value: 'bard', conditions: { level: 5 }

    create :character_feat, feat: feat1, character: character
    create :character_feat, feat: feat2, character: character

    character.data['selected_feats'] = { key: ['something'] }
    character.save
  end

  it 'attaches feats to character', :aggregate_failures do
    service_call

    expect(character.feats.pluck(:feat_id)).to contain_exactly(feat2.id, feat3.id, feat4.id)
    expect(Feat.find(feat4.id).limit_refresh).to eq 'long_rest'
    expect(Feat.find(feat3.id).limit_refresh).to eq 'short_rest'
    expect(character.feats.find_by(feat_id: feat4.id).limit_refresh).to eq 1
    expect(character.feats.find_by(feat_id: feat3.id).limit_refresh).to eq 0
  end
end
