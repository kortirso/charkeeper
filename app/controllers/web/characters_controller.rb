# frozen_string_literal: true

module Web
  class CharactersController < Web::BaseController
    before_action :find_character

    def show
      respond_to do |format|
        format.pdf do
          send_data(
            CharactersContext::GeneratePdfCharacterSheet.new.call(character: @character),
            type: 'application/pdf',
            filename: "#{@character.name}.pdf"
          )
        end
      end
    end

    private

    def find_character
      @character = Character.find(params[:id])
    end
  end
end
