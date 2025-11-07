# frozen_string_literal: true

module Dc20Character
  class ClassUpdater
    def call(character:)
      class_updater(character.data.main_class).call(character: character)
    end

    private

    def class_updater(main_class)
      "Dc20Character::Classes::#{main_class.camelize}Updater".constantize.new
    end
  end
end
