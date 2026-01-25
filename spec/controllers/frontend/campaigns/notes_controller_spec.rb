# frozen_string_literal: true

describe Frontend::Campaigns::NotesController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  let!(:campaign) { create :campaign, :dnd5 }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting campaign' do
        it 'returns error' do
          get :index, params: { campaign_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for existing campaign' do
        before { create :campaign_note, campaign: campaign }

        it 'returns data', :aggregate_failures do
          get :index, params: { campaign_id: campaign.id, charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('notes', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['notes'].size).to eq 1
          expect(response_values.keys).to contain_exactly('id', 'title', 'value', 'markdown_value')
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting campaign' do
        it 'returns error' do
          post :create, params: {
            campaign_id: 'unexisting', note: { title: 'title', value: 'value' }, charkeeper_access_token: access_token
          }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user campaign' do
        let(:request) {
          post :create, params: {
            campaign_id: campaign.id, note: { title: 'title', value: 'value' }, charkeeper_access_token: access_token
          }
        }

        it 'creates campaign note', :aggregate_failures do
          expect { request }.to change(campaign.notes, :count).by(1)
          expect(response).to have_http_status :created
          expect(response.parsed_body['note'].keys).to contain_exactly('id', 'title', 'value', 'markdown_value')
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      context 'for unexisting campaign' do
        it 'returns error' do
          delete :destroy, params: { campaign_id: 'unexisting', id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user campaign' do
        context 'for unexisting note' do
          let(:request) {
            delete :destroy, params: {
              campaign_id: campaign.id,
              id: 'unexisting',
              charkeeper_access_token: access_token
            }
          }

          it 'does not delete campaign note', :aggregate_failures do
            expect { request }.not_to change(Campaign::Note, :count)
            expect(response).to have_http_status :not_found
          end
        end

        context 'for existing note' do
          let!(:note) { create :campaign_note, campaign: campaign }
          let(:request) {
            delete :destroy, params: {
              campaign_id: campaign.id,
              id: note.id,
              charkeeper_access_token: access_token
            }
          }

          it 'deletes campaign note', :aggregate_failures do
            expect { request }.to change(campaign.notes, :count).by(-1)
            expect(response).to have_http_status :ok
            expect(response.parsed_body).to eq({ 'result' => 'ok' })
          end
        end
      end
    end
  end
end
