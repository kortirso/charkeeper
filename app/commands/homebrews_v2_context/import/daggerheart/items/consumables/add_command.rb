# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Items
        module Consumables
          class AddCommand < BaseCommand
            include Deps[
              formula: 'formula'
            ]

            use_contract do
              ConsumeAttributes = Dry::Types['strict.string'].enum('health_marked', 'stress_marked', 'hope_marked')
              BonusTypes = Dry::Types['strict.string'].enum('static', 'dynamic')

              params do
                required(:user).filled(type?: ::User)
                required(:name).hash do
                  required(:en).filled(:string, max_size?: 50)
                  optional(:ru).maybe(:string, max_size?: 50)
                  optional(:es).maybe(:string, max_size?: 50)
                end
                required(:description).hash do
                  required(:en).filled(:string, max_size?: 500)
                  optional(:ru).maybe(:string, max_size?: 500)
                  optional(:es).maybe(:string, max_size?: 500)
                end
                optional(:consume).maybe(:array).each(:hash) do
                  required(:id).filled(type?: Integer)
                  required(:attribute).filled(ConsumeAttributes)
                  required(:formula).filled(:string)
                end
                optional(:public).filled(:bool)
              end
            end

            private

            def validate_content(input)
              return unless input.key?(:consume)
              return if input[:consume].all? { |consume| formula.call(formula: consume[:formula]).present? }

              [I18n.t('commands.homebrew_context.daggerheart.items.add.invalid_formula')]
            end

            def do_prepare(input)
              if input.key?(:consume)
                consume_result = input[:consume].select do |consume|
                  result = formula.call(formula: consume[:formula])
                  next unless result

                  consume
                end
                input[:info] = { consume: consume_result } if consume_result.any?
              end

              input[:name].transform_values! { |value| sanitize(value) }
              input[:description].transform_values! { |value| sanitize(value) }
              input[:kind] = 'consumables'
            end

            def do_persist(input)
              result = ::Daggerheart::Item.create!(input.except(:consume))

              { result: result }
            end
          end
        end
      end
    end
  end
end
