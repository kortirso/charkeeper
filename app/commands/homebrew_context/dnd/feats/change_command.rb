# frozen_string_literal: true

module HomebrewContext
  module Dnd
    module Feats
      class ChangeCommand < BaseCommand
        # include Deps[formula: 'formula']

        use_contract do
          config.messages.namespace = :homebrew_feat

          Kinds = Dry::Types['strict.string'].enum('static', 'text', 'update_result', 'hidden')
          Limits = Dry::Types['strict.string'].enum('short_rest', 'long_rest', 'one_at_short_rest')

          params do
            required(:feat).filled(type?: ::Dnd2024::Feat)
            optional(:title).filled(:string, max_size?: 50)
            optional(:description).filled(:string, max_size?: 500)
            optional(:kind).filled(Kinds)
            optional(:level).filled(:integer, gteq?: 1)
            optional(:limit).filled(:integer, gteq?: 1)
            optional(:limit_refresh).filled(Limits)
            optional(:modifiers).hash
            optional(:continious).filled(:bool)
            optional(:static_spells).hash
            optional(:ability_conditions).maybe(:array).each(:string)
            optional(:leveling_ability_boosts).maybe(:array).each(:string)
          end

          rule(:limit, :limit_refresh).validate(:check_all_or_nothing_present)
        end

        private

        # def validate_content(input)
        #   return unless input.key?(:modifiers)
        #   return if input[:modifiers].values.all? { |value| formula.call(formula: value).present? }

        #   [I18n.t('commands.homebrew_context.dnd.feats.add.invalid_formula')]
        # end

        def do_prepare(input) # rubocop: disable Metrics/AbcSize, Metrics/MethodLength
          if input.key?(:limit)
            input[:description_eval_variables] =
              input[:feat].description_eval_variables.symbolize_keys.merge({ limit: input[:limit].to_s })
          end
          if input.key?(:level)
            input[:conditions] =
              input[:feat].conditions.symbolize_keys.merge({ level: input[:level] })
          end
          if input.key?(:ability_conditions)
            input[:conditions] =
              input[:feat].conditions.symbolize_keys.merge({ ability: input[:ability_conditions] })
          end
          if input.key?(:static_spells)
            input[:info] =
              input[:feat].info.symbolize_keys.merge({ static_spells: input[:static_spells] })
          end
          if input.key?(:leveling_ability_boosts)
            input[:info] =
              input[:feat].info.symbolize_keys.deep_merge({
                rewrite: { ability_boosts: input[:leveling_ability_boosts], leveling_ability_boosts: 1 }
              })
          end
          if input.key?(:description)
            input[:description] = { en: sanitize(input[:description]), ru: sanitize(input[:description]) }
          end
          input[:title] = { en: sanitize(input[:title]), ru: sanitize(input[:title]) } if input.key?(:title)
        end

        def do_persist(input)
          input[:feat].update!(input.except(:feat, :limit, :level, :static_spells, :ability_conditions, :leveling_ability_boosts))

          { result: input[:feat] }
        end
      end
    end
  end
end
