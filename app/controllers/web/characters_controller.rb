# frozen_string_literal: true

module Web
  class CharactersController < Web::BaseController
    skip_before_action :authenticate
    skip_before_action :update_locale
    skip_before_action :set_locale
    before_action :find_character
    before_action :check_allowed_providers

    ALLOWED_PROVIDERS = %w[Daggerheart::Character].freeze

    def show
      respond_to do |format|
        format.json do
          render json: CharactersContext::GenerateJsonCharacterSheet.new.call(character: @character), status: :ok
        end
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

    def check_allowed_providers
      return if @character.class.name.in?(ALLOWED_PROVIDERS)

      raise ActiveRecord::RecordNotFound
    end
  end
end
