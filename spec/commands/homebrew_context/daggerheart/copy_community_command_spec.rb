# frozen_string_literal: true

describe HomebrewContext::Daggerheart::CopyCommunityCommand do
  subject(:command_call) { instance.call({ user: another_user, community: Daggerheart::Homebrew::Community.find(community.id) }) }

  let(:instance) { described_class.new }
  let!(:another_user) { create :user }
  let!(:user) { create :user }
  let!(:community) { create :homebrew_community, :daggerheart, user: user }

  before { create :feat, :rally, user: user, origin: 1, origin_value: community.id }

  it 'creates new community with feat', :aggregate_failures do
    expect { command_call }.to(
      change(Daggerheart::Homebrew::Community, :count).by(1)
        .and(change(Feat, :count).by(1))
    )
    expect(command_call[:errors]).to be_nil
    expect(Feat.last.origin_value).to eq Daggerheart::Homebrew::Community.last.id
  end
end
