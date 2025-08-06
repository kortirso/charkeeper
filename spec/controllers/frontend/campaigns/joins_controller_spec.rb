# frozen_string_literal: true

describe Frontend::Campaigns::JoinsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:campaign) { create :campaign, :daggerheart }

  describe 'GET#show' do
    context 'for logged users' do
      context 'for unexisting campaign' do
        it 'returns error' do
          get :show, params: { campaign_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user campaign' do
        it 'returns error' do
          get :show, params: { campaign_id: campaign.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
        end
      end

      context 'for user campaign' do
        before { campaign.update!(user: user_session.user) }

        it 'renders campaign' do
          get :show, params: { campaign_id: campaign.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
        end
      end
    end
  end

  describe 'POST#create' do
    let!(:daggerheart_character) { create :character, :daggerheart }
    let!(:character) { create :character }

    context 'for logged users' do
      context 'for unexisting campaign' do
        let(:request) {
          post :create, params: {
            campaign_id: 'unexisting', character_id: daggerheart_character.id, charkeeper_access_token: access_token
          }
        }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(campaign.campaign_characters, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for unexisting character' do
        let(:request) {
          post :create, params: {
            campaign_id: campaign.id, character_id: 'unexisting', charkeeper_access_token: access_token
          }
        }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(campaign.campaign_characters, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for invalid character' do
        let(:request) {
          post :create, params: {
            campaign_id: campaign.id, character_id: character.id, charkeeper_access_token: access_token
          }
        }

        before { character.update!(user: user_session.user) }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(campaign.campaign_characters, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user character' do
        let(:request) {
          post :create, params: {
            campaign_id: campaign.id, character_id: daggerheart_character.id, charkeeper_access_token: access_token
          }
        }

        it 'returns error', :aggregate_failures do
          expect { request }.not_to change(campaign.campaign_characters, :count)
          expect(response).to have_http_status :not_found
        end
      end

      context 'for valid character' do
        let(:request) {
          post :create, params: {
            campaign_id: campaign.id, character_id: daggerheart_character.id, charkeeper_access_token: access_token
          }
        }

        before { daggerheart_character.update!(user: user_session.user) }

        it 'creates campaign character', :aggregate_failures do
          expect { request }.to change(campaign.campaign_characters, :count).by(1)
          expect(response).to have_http_status :ok
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:campaign_character) { create :campaign_character, campaign: campaign }

      context 'for unexisting campaign' do
        it 'returns error' do
          delete :destroy, params: {
            campaign_id: 'unexisting', character_id: campaign_character.id, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for not user campaign' do
        it 'returns error' do
          delete :destroy, params: {
            campaign_id: campaign.id, character_id: campaign_character.id, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :forbidden
        end
      end

      context 'for user campaign' do
        let(:request) do
          delete :destroy, params: {
            campaign_id: campaign.id, character_id: campaign_character.id, charkeeper_access_token: access_token
          }
        end

        before { campaign.update!(user: user_session.user) }

        it 'deletes campaign character', :aggregate_failures do
          expect { request }.to change(Campaign::Character, :count).by(-1)
          expect(response).to have_http_status :ok
          expect(response.parsed_body).to eq({ 'result' => 'ok' })
        end
      end
    end
  end
end
