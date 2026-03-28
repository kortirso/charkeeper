# frozen_string_literal: true

module Dnd2024Character
  class BackgroundBuilder
    def call(result:)
      return result if result[:background].blank?

      background_builder(result[:background]).call(result: result)
    end

    private

    def background_builder(background)
      default = ::Dnd2024::Character.backgrounds[background]
      return "Dnd2024Character::Backgrounds::#{background.camelize}Builder".constantize.new if default

      Dnd2024Character::Backgrounds::CustomBuilder.new
    rescue NameError => _e
      DummyBuilder.new
    end
  end
end
