# frozen_string_literal: true

describe Frontend::CampaignsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      let!(:campaign1) { create :campaign, :dnd5, user: user_session.user }
      let!(:campaign2) { create :campaign, :daggerheart }
      let!(:character) { create :character, :daggerheart, user: user_session.user }

      before do
        create :campaign, :dnd2024

        create :campaign_character, campaign: campaign2, character: character
      end

      it 'returns data', :aggregate_failures do
        get :index, params: { charkeeper_access_token: access_token }

        response_values = response.parsed_body.dig('campaigns', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['campaigns'].size).to eq 2
        expect(response_values.keys).to contain_exactly('id', 'name', 'provider')
        expect(response.parsed_body['campaigns'].pluck('id')).to contain_exactly(campaign1.id, campaign2.id)
      end
    end
  end
end
