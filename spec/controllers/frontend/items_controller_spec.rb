# frozen_string_literal: true

describe Frontend::ItemsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      context 'for dnd' do
        before { create :item, type: 'Dnd5::Item' }

        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'dnd5', charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('items', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['items'].size).to eq 1
          expect(response_values.keys).to contain_exactly('id', 'slug', 'kind', 'name', 'data', 'info', 'homebrew')
        end
      end

      context 'for pathfinder2' do
        before { create :item, type: 'Pathfinder2::Item' }

        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'pathfinder2', charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('items', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['items'].size).to eq 1
          expect(response_values.keys).to contain_exactly('id', 'slug', 'kind', 'name', 'data', 'info', 'homebrew')
        end
      end

      context 'for daggerheart' do
        before { create :item, type: 'Daggerheart::Item' }

        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token }

          response_values = response.parsed_body.dig('items', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['items'].size).to eq 1
          expect(response_values.keys).to contain_exactly('id', 'slug', 'kind', 'name', 'data', 'info', 'homebrew')
        end
      end

      context 'for unknown' do
        it 'returns data', :aggregate_failures do
          get :index, params: { provider: 'unknown', charkeeper_access_token: access_token }

          expect(response).to have_http_status :not_found
        end
      end
    end
  end
end
