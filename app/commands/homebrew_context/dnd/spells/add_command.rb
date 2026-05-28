# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Spells
      class AddCommand < BaseCommand
        use_contract do
          config.messages.namespace = :homebrew_feat

          Dcs = Dry::Types['strict.string'].enum('str', 'dex', 'con', 'wis', 'int', 'cha')
          Classes = Dry::Types['strict.string'].enum(*::Dnd2024::Character.classes_info.keys)

          params do
            required(:user).filled(type?: ::User)
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
          input[:slug] = SecureRandom.alphanumeric(10)
          input[:origin] = 6
          input[:kind] = 'static'
          input[:title].transform_values! { |value| sanitize(value) }
          input[:description].transform_values! { |value| sanitize(value) }
          input[:info] = input[:info].compact_blank
        end

        def do_persist(input)
          result = ::Dnd2024::Feat.create!(input)

          { result: result }
        end
      end
    end
  end
end
