# frozen_string_literal: true

describe 'Homebrews' do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    let!(:daggerheart_race) { create :homebrew_race, :daggerheart, user: user_session.user }

    it 'renders index page', :aggregate_failures do
      get "/frontend/homebrews.json?charkeeper_access_token=#{access_token}"

      expect(response).to have_http_status :ok

      daggerheart_breweries = response.parsed_body['daggerheart']
      expect(daggerheart_breweries['heritages']).to(
        eq({ daggerheart_race.id => { 'name' => { 'en' => 'Race', 'ru' => 'Race' } } })
      )
    end
  end
end
