# frozen_string_literal: true

describe Frontend::CharactersController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before do
        create :character, user: user_session.user
      end

      it 'returns data', :aggregate_failures do
        get :index, params: { charkeeper_access_token: access_token }

        response_values = response.parsed_body.dig('characters', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['characters'].size).to eq 1
        expect(response_values.keys).to contain_exactly(
          'id', 'name', 'level', 'race', 'subrace', 'classes', 'provider', 'created_at', 'avatar'
        )
      end
    end
  end

  describe 'GET#show' do
    context 'for logged users' do
      context 'for not existing character' do
        it 'returns error', :aggregate_failures do
          get :show, params: { id: 'unexisting', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
          expect(response.parsed_body['errors']).to eq(['Запись не найдена'])
        end
      end

      context 'for dnd5' do
        let!(:character) { create :character, user: user_session.user }

        it 'returns data', :aggregate_failures do
          get :show, params: { id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
          expect(response.parsed_body.dig('character', 'id')).to eq character.id
        end

        context 'when only_head param is present' do
          it 'returns only head', :aggregate_failures do
            get :show, params: { id: character.id, charkeeper_access_token: access_token, only_head: true }

            expect(response).to have_http_status :ok
            expect(response.parsed_body.dig('character', 'id')).to be_nil
            expect(response.parsed_body['result']).to eq 'ok'
          end
        end

        context 'when only param is present' do
          it 'returns only specific attributes', :aggregate_failures do
            get :show, params: { id: character.id, charkeeper_access_token: access_token, only: 'id,name' }

            expect(response).to have_http_status :ok
            expect(response.parsed_body['character'].keys).to contain_exactly('id', 'name')
          end
        end
      end

      context 'for dnd2024' do
        let!(:character) { create :character, :dnd2024, user: user_session.user }

        it 'returns data' do
          get :show, params: { id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
        end

        context 'for not user character' do
          let!(:another_character) { create :character, :dnd2024 }

          it 'returns error' do
            get :show, params: { id: another_character.id, charkeeper_access_token: access_token }

            expect(response).to have_http_status :not_found
          end

          context 'when user is admin' do
            before { user_session.user.update!(admin: true) }

            it 'returns data' do
              get :show, params: { id: another_character.id, charkeeper_access_token: access_token }

              expect(response).to have_http_status :ok
            end
          end
        end
      end

      context 'for pathfinder 2' do
        let!(:character) { create :character, :pathfinder2, user: user_session.user }

        it 'returns data' do
          get :show, params: { id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
        end
      end

      context 'for daggerheart' do
        let!(:character) { create :character, :daggerheart, user: user_session.user }

        it 'returns data' do
          get :show, params: { id: character.id, charkeeper_access_token: access_token }

          expect(response).to have_http_status :ok
        end
      end
    end
  end

  describe 'DELETE#destroy' do
    context 'for logged users' do
      let!(:character) { create :character }

      context 'for existing character' do
        let(:request) { delete :destroy, params: { id: character.id, charkeeper_access_token: access_token } }

        context 'for user character' do
          before { character.update!(user: user_session.user) }

          it 'destroys character', :aggregate_failures do
            expect { request }.to change(Character, :count).by(-1)
            expect(Character.find_by(id: character.id)).to be_nil
          end
        end

        context 'for not user character' do
          it 'does not destroy any character' do
            expect { request }.not_to change(Character, :count)
          end
        end
      end

      context 'for not existing character' do
        let(:request) { delete :destroy, params: { id: 'unexisting', charkeeper_access_token: access_token } }

        it 'does not destroy any character' do
          expect { request }.not_to change(Character, :count)
        end
      end
    end
  end
end
