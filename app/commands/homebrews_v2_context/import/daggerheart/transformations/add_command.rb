# frozen_string_literal: true

module HomebrewsV2Context
  module Import
    module Daggerheart
      module Transformations
        class AddCommand < BaseCommand
          include Deps[
            add_feat: 'commands.homebrews_v2_context.import.daggerheart.feats.add'
          ]

          private

          def do_persist(input)
            result = ActiveRecord::Base.transaction do
              transformation =
                ::Daggerheart::Homebrews::Transformation.create!(input.slice(:user, :title, :description, :public))
              input[:features]&.each do |feature|
                add_feat.call(
                  feature.except(:id).merge({
                    user: input[:user],
                    origin: 'transformation',
                    origin_value: transformation.id,
                    no_refresh: true,
                    skip_contract_validation: true
                  })
                )
              end
              transformation
            end

            { result: result }
          end
        end
      end
    end
  end
end
