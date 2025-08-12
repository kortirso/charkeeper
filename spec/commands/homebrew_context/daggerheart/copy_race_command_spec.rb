# frozen_string_literal: true

describe HomebrewContext::Daggerheart::CopyRaceCommand do
  subject(:command_call) { instance.call({ user: another_user, race: Daggerheart::Homebrew::Race.find(race.id) }) }

  let(:instance) { described_class.new }
  let!(:another_user) { create :user }
  let!(:user) { create :user }
  let!(:race) { create :homebrew_race, :daggerheart, user: user }

  before { create :feat, :rally, user: user, origin: 'ancestry', origin_value: race.id }

  it 'creates new race with feat', :aggregate_failures do
    expect { command_call }.to(
      change(Daggerheart::Homebrew::Race, :count).by(1)
        .and(change(Feat, :count).by(1))
    )
    expect(command_call[:errors]).to be_nil
    expect(Feat.last.origin_value).to eq Daggerheart::Homebrew::Race.last.id
  end
end
