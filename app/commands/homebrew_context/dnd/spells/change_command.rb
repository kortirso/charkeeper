# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Spells
      class ChangeCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_feat

          Dcs = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'wis', 'int', 'cha')
          Classes = Dry::Types['strict.string'].enum(*::Dnd2024::Character.classes_info.keys)

          params do
            required(:spell).filled(type?: ::Dnd2024::Feat)
            required(:title).hash
            optional(:description).hash
            required(:origin_values).filled(:array).each(Classes)
            optional(:public).filled(:bool)
            required(:info).hash do
              required(:level).filled(:integer, gteq?: 0)
              required(:school).filled(:string)
              required(:time).filled(:string)
              required(:range).filled(:string)
              required(:components).filled(:string)
              required(:duration).filled(:string)
              # optional(:effects).maybe(:array).each(:string)
              optional(:hit).filled(:bool)
              optional(:dc).maybe(Dcs)
              # optional(:area).maybe(:string)
            end
          end
        end

        private

        def do_prepare(input)
          input[:title].transform_values! { |value| sanitize(value) }
          input[:description].transform_values! { |value| sanitize(value) }
          input[:info] = input[:info].compact_blank
        end

        def do_persist(input)
          input[:spell].update!(input.except(:spell))

          { result: input[:spell] }
        end
      end
    end
  end
end
