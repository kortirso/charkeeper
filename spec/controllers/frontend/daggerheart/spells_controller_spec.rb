# frozen_string_literal: true

describe Frontend::Daggerheart::SpellsController do
  let!(:user_session) { create :user_session }
  let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

  describe 'GET#index' do
    context 'for logged users' do
      before do
        create :daggerheart_feat, origin: 7, origin_value: 'bone', conditions: { level: 1 }
        create :daggerheart_feat, origin: 7, origin_value: 'arcana', conditions: { level: 2 }
        create :daggerheart_feat, origin: 7, origin_value: 'midnight', conditions: { level: 3 }
      end

      it 'returns data', :aggregate_failures do
        get :index, params: { charkeeper_access_token: access_token, format: :json, version: '0.3.8' }

        response_values = response.parsed_body.dig('spells', 0)

        expect(response).to have_http_status :ok
        expect(response.parsed_body['spells'].size).to eq 3
        expect(response_values.keys).to(
          contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions', 'info')
        )
      end

      context 'with spell for extended domain' do
        let!(:domain) { create :homebrew, :daggerheart_domain, info: { domain_id: 'bone' }, user: user_session.user }

        before do
          create :daggerheart_feat, origin: 7, origin_value: domain.id, conditions: { level: 1 }, user: user_session.user
        end

        it 'returns data', :aggregate_failures do
          get :index, params: { charkeeper_access_token: access_token, format: :json, version: '0.3.8' }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 3
          expect(response_values.keys).to(
            contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions', 'info')
          )
        end

        context 'when user has access to extended domain' do
          before do
            book = create :homebrew_book
            create :homebrew_book_item, homebrew_book: book, itemable: domain
            create :user_book, user: user_session.user, book: book

            HomebrewsContext::RefreshUserDataService.new.call(user: user_session.user)
          end

          it 'returns data', :aggregate_failures do
            get :index, params: { charkeeper_access_token: access_token, format: :json, version: '0.3.8' }

            response_values = response.parsed_body.dig('spells', 0)

            expect(response).to have_http_status :ok
            expect(response.parsed_body['spells'].size).to eq 4
            expect(response_values.keys).to(
              contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions', 'info')
            )
          end
        end
      end

      context 'for old app version' do
        it 'returns empty data', :aggregate_failures do
          get :index, params: { charkeeper_access_token: access_token, format: :json }

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 0
        end
      end

      context 'with filtering' do
        it 'returns data', :aggregate_failures do
          get :index, params: { charkeeper_access_token: access_token, domains: 'bone,arcana', format: :json, version: '0.3.8' }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 2
          expect(response.parsed_body['spells'].pluck('origin_value').sort).to eq(%w[arcana bone])
          expect(response_values.keys).to(
            contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions', 'info')
          )
        end
      end

      context 'with filtering by level' do
        it 'returns data', :aggregate_failures do
          get :index, params: {
            charkeeper_access_token: access_token, domains: 'bone,arcana,midnight', max_level: 1, format: :json, version: '0.3.8'
          }

          response_values = response.parsed_body.dig('spells', 0)

          expect(response).to have_http_status :ok
          expect(response.parsed_body['spells'].size).to eq 1
          expect(response.parsed_body['spells'].pluck('origin_value').sort).to eq(%w[bone])
          expect(response_values.keys).to(
            contain_exactly('id', 'slug', 'title', 'description', 'origin_value', 'conditions', 'info')
          )
        end
      end
    end
  end
end
