# frozen_string_literal: true

describe 'Characters' do
  describe 'GET#index' do
    context 'without characters' do
      it 'renders index page' do
        get '/adminbook/dnd2024/characters'

        expect(response).to have_http_status :ok
      end
    end

    context 'with characters' do
      let!(:character1) { create :character }
      let!(:character2) { create :character, :dnd2024 }

      it 'renders index page', :aggregate_failures do
        get '/adminbook/dnd2024/characters'

        expect(response).to have_http_status :ok
        expect(response.body).not_to include(character1.name)
        expect(response.body).to include(character2.name)
      end
    end
  end
end
