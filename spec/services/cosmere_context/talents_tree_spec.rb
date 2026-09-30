# frozen_string_literal: true

describe CosmereContext::TalentsTree do
  subject(:service_call) {
    described_class.new.call(selected_feat_slugs: [], selected_feat_ids: [], character: Cosmere::Character.find(character.id))
  }

  let!(:character) { create :character, :cosmere }

  it 'returns data' do
    expect(service_call[:paths]).not_to be_nil
  end
end
