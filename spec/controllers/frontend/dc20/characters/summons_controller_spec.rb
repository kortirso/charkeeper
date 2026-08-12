# frozen_string_literal: true

describe Frontend::Dc20::Characters::SummonsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }
  let!(:user_character) { create :dc20_character, user: user_session.user }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          get :index, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'without wild_forms' do
          it 'returns data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            expect(response).to have_http_status :ok
            expect(response.parsed_body['summons'].size).to eq 0
          end
        end

        context 'with summons' do
          before { create :dc20_summon, parent: user_character }

          it 'returns data', :aggregate_failures do
            get :index, params: { character_id: user_character.id, charkeeper_access_token: access_token }

            expect(response).to have_http_status :ok
            expect(response.parsed_body['summons'].size).to eq 1
          end
        end
      end
    end
  end

  describe 'POST#create' do
    context 'for logged users' do
      context 'for unexisting character' do
        it 'returns error' do
          post :create, params: { character_id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end

      context 'for user character' do
        context 'with invalid params' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, summon: { name: '', kind: 'undead' }, charkeeper_access_token: access_token
            }
          }

          it 'returns error', :aggregate_failures do
            expect { request }.not_to change(Dc20::Summon, :count)
            expect(response).to have_http_status :unprocessable_content
          end
        end

        context 'with valid params' do
          let(:request) {
            post :create, params: {
              character_id: user_character.id, summon: { name: 'Form', kind: 'undead' }, charkeeper_access_token: access_token
            }
          }

          it 'creates wild form', :aggregate_failures do
            expect { request }.to change(Dc20::Summon, :count).by(1)
            expect(response).to have_http_status :created
          end
        end
      end
    end
  end
end
