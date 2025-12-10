# frozen_string_literal: true

module Frontend
  module Dc20
    module Characters
      module Talents
        class FeaturesController < Frontend::BaseController
          include SerializeRelation

          before_action :find_character

          def index
            serialize_relation(available_talents, ::Dc20::Characters::TalentSerializer, :talents)
          end

          private

          def find_character
            @character = authorized_scope(Character.all).dc20.find(params[:character_id])
          end

          # rubocop: disable Style/IdenticalConditionalBranches, Lint/DuplicateBranch
          def available_talents
            case params[:multiclass_level]
            when 1, 2 then class_features
            else class_features
            end
          end
          # rubocop: enable Style/IdenticalConditionalBranches, Lint/DuplicateBranch

          def class_features
            selected_features = @character.feats.joins(:feat).where(feats: { origin: 1 }).pluck(:feat_id)
            ::Dc20::Feat.where(origin: 1).select do |talent|
              next false if talent.conditions['level'] > params[:multiclass_level].to_i
              next false if talent.id.in?(selected_features)

              true
            end
          end
        end
      end
    end
  end
end
