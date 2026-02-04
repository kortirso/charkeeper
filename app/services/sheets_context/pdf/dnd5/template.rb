# frozen_string_literal: true

module SheetsContext
  module Pdf
    module Dnd5
      class Template < SheetsContext::Pdf::Dnd::Template
        def to_pdf(character:, phtml: nil)
          super

          render
        end

        private

        def heritage(character)
          subrace(character) || race(character)
        end

        def classes(character)
          character.subclasses.map do |key, value|
            next "#{class_name(key)} #{character.classes[key]}" if value.nil?

            "#{class_name(key)} #{character.classes[key]} (#{subclass_name(key, value)})"
          end.join(' / ') # rubocop: disable Style/MethodCalledOnDoEndBlock
        end

        def race(character)
          translate(::Dnd5::Character.race_info(character.race)['name'])
        end

        def subrace(character)
          return unless character.subrace

          translate(::Dnd5::Character.subrace_info(character.race, character.subrace)['name'])
        end

        def class_name(class_slug)
          translate(::Dnd5::Character.class_info(class_slug)['name'])
        end

        def subclass_name(class_slug, subclass_slug)
          translate(::Dnd5::Character.subclass_info(class_slug, subclass_slug)['name'])
        end
      end
    end
  end
end
