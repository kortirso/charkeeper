# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dnd2024
      class Template < SheetsContext::Pdf::Dnd::Template
        def to_pdf(character:)
          super

          render
        end

        private

        def heritage(character)
          [race(character), subrace(character)].compact.join(' / ')
        end

        def classes(character)
          character.subclasses.map do |key, value|
            next "#{class_name(key)} #{character.classes[key]}" if value.nil?

            "#{class_name(key)} #{character.classes[key]} (#{subclass_name(key, value)})"
          end.join(' / ') # rubocop: disable Style/MethodCalledOnDoEndBlock
        end

        def race(character)
          ::Dnd2024::Character.species_info(character.species).dig('name', I18n.locale.to_s)
        end

        def subrace(character)
          return unless character.legacy

          ::Dnd2024::Character.legacy_info(character.species, character.legacy).dig('name', I18n.locale.to_s)
        end

        def class_name(class_slug)
          ::Dnd2024::Character.class_info(class_slug).dig('name', I18n.locale.to_s)
        end

        def subclass_name(class_slug, subclass_slug)
          ::Dnd2024::Character.subclass_info(class_slug, subclass_slug).dig('name', I18n.locale.to_s)
        end
      end
    end
  end
end
