# frozen_string_literal: true

describe CharactersContext::Dnd5::RefreshFeats do
  subject(:service_call) { described_class.new.call(character: Dnd5::Character.find(character.id)) }

  let!(:feat1) { create :feat, :rally, :dnd5 }
  let!(:feat2) { create :feat, :rally, :dnd5 }
  let!(:feat3) { create :feat, :rally, :dnd5, exclude: [feat1.slug] }
  let!(:feat4) { create :feat, :rally, :dnd5, conditions: { selected_feats: ['something'] } }
  let!(:character) { create :character, :bard }

  before do
    create :feat, :rally, origin: 2, origin_value: 'bard', conditions: { level: 5 }

    create :character_feat, feat: feat1, character: character
    create :character_feat, feat: feat2, character: character

    character.data['selected_feats'] = { key: ['something'] }
    character.save
  end

  it 'attaches feats to character' do
    service_call

    expect(character.feats.pluck(:feat_id)).to contain_exactly(feat2.id, feat3.id, feat4.id)
  end
end
