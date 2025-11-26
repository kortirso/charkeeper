# frozen_string_literal: true

# describe Frontend::Homebrews::BooksController do
#   let!(:user_session) { create :user_session }
#   let(:access_token) { Authkeeper::GenerateTokenService.new.call(user_session: user_session)[:result] }

#   describe 'GET#index' do
#     context 'for logged users' do
#       context 'for Daggerheart' do
#         let(:request) { get :index, params: { provider: 'daggerheart', charkeeper_access_token: access_token } }

#         before do
#           book = create :homebrew_book, user: user_session.user
#           race = create :homebrew_race, :daggerheart, user: user_session.user
#           create :homebrew_book_item, homebrew_book: book, itemable_id: race.id, itemable_type: 'Daggerheart::Homebrew::Race'
#         end

#         it 'returns data', :aggregate_failures do
#           request

#           expect(response).to have_http_status :ok
#           expect(response.parsed_body['books'].size).to eq 1
#         end
#       end
#     end
#   end
# end
