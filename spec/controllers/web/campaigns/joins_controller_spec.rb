# frozen_string_literal: true

describe Web::Campaigns::JoinsController do
  render_views

  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:campaign) { create :campaign }

  describe 'GET#show' do
    it 'renders app' do
      get :show, params: { campaign_id: campaign.id, charkeeper_access_token: access_token }

      expect(response).to have_http_status :ok
    end
  end
end
