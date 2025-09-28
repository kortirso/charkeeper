# frozen_string_literal: true

module Web
  class CharactersController < Web::BaseController
    skip_before_action :authenticate
    skip_before_action :update_locale
    skip_before_action :set_locale
    before_action :find_character

    def show
      respond_to do |format|
        format.json do
          render json: SheetsContext::Json::Generate.new.call(character: @character), status: :ok
        end
        format.pdf do
          send_data(
            SheetsContext::Pdf::Generate.new.call(character: @character),
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
