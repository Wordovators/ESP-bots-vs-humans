# setup

setwd('~/Work/NZILBB/convergence_esp_2/ESP-bots-vs-humans/peter/')
library(Hmisc)
library(stringr)
library(dplyr)
library(stringdist)
library(lme4)
library(effects)

# functions

# expects character vectors (and numbers for var_s and var_p, of course)
GCM <- function(test_forms,category_A,category_B,all_forms,var_s,var_p){
vector_sim_cat_A = as.numeric(NULL)
vector_sim_cat_B = as.numeric(NULL)

for (i in 1:length(test_forms)){
  form1 = test_forms[i]  
  
  vector_pairwise_sims_cat_A = as.numeric(NULL)
  
    for (ii in 1:length(category_A)){
      form2 = category_A[ii]
        dist = stringdist(form1,form2, method = 'lv')
          pairwise_sim = exp ( - dist / var_s )^var_p
            vector_pairwise_sims_cat_A[ii] = pairwise_sim
    }
  
  sum_pairwise_sims_cat_A = sum(vector_pairwise_sims_cat_A)
  
  vector_pairwise_sims_cat_B = as.numeric(NULL)
  
    for (ii in 1:length(category_B)){
      form2 = category_B[ii]
        dist = stringdist(form1,form2, method = 'lv')
          pairwise_sim = exp ( - dist / var_s )^var_p
            vector_pairwise_sims_cat_B[ii] = pairwise_sim
    }
  
  sum_pairwise_sims_cat_B = sum(vector_pairwise_sims_cat_B)
  
  vector_pairwise_sims_all_forms = as.numeric(NULL)
  
    for (ii in 1:length(all_forms)){
      form2 = all_forms[ii]
        dist = stringdist(form1,form2, method = 'lv')
          pairwise_sim = exp ( - dist / var_s )^var_p
            vector_pairwise_sims_all_forms[ii] = pairwise_sim
    }
  
  sum_pairwise_sims_all_forms = sum(vector_pairwise_sims_all_forms)
  
  sim_cat_A = sum_pairwise_sims_cat_A / sum_pairwise_sims_all_forms
  sim_cat_B = sum_pairwise_sims_cat_B / sum_pairwise_sims_all_forms
  
  vector_sim_cat_A[i] <- sim_cat_A
  vector_sim_cat_B[i] <- sim_cat_B

}

output_thing <- cbind(test_forms,vector_sim_cat_A,vector_sim_cat_B) %>% data.frame(options(stringsAsFactors = FALSE)) %>% rename(disc = test_forms) %>% mutate(weight_A = as.numeric(vector_sim_cat_A), weight_B = as.numeric(vector_sim_cat_B)) %>% select(disc,weight_A,weight_B)

return(output_thing)
}

# expects two data frames, sets var_s and var_p
runGCMonVerbs <- function(training,test){
var_s = 0.3
var_p = 1

output_things <- as.list(NULL)

for (i in 1:4){
moder_name <- c("KEPT","SANG","DROVE","BURNT")[i]

training_regular_forms <- training %>% filter(moder == moder_name,class == 'regular') %>% select(present) %>% pull %>% as.character
training_irregular_forms <- training %>% filter(moder == moder_name,class == 'irregular') %>% select(present) %>% pull %>% as.character
all_training_forms <- c(training_regular_forms,training_irregular_forms)
test_forms <- test %>% filter(moder == moder_name) %>% select(present) %>% pull %>% as.character
  
results_df <- GCM(test_forms,training_regular_forms,training_irregular_forms,all_training_forms,var_s,var_p)  

output_things[[i]] <- results_df

}

output_things_df <- do.call('rbind', output_things) %>% rename(gcm_regular_nof = weight_A) %>% select(disc,gcm_regular_nof)

return(output_things_df)

}

# does espdata have disc & moder in it?

runGuyNoFeature <- function(espdata,training,person_id){

training_esp <- espdata %>% filter(participant_id==person_id, phase=='esp') %>% select(word,disc,moder,resp_bot_reg) %>% mutate(class = ifelse(resp_bot_reg==T, 'regular', 'irregular')) %>% select(disc,moder,class) %>% rename(present = disc)

training_corpus <- training %>% filter(!is.na(moder)) %>% select(present,moder,class)

training_person <- rbind(training_esp,training_corpus)

test_person <- espdata %>% filter(participant_id==person_id, phase=='test2') %>% select(disc,moder) %>% rename(present = disc)

results_person <- runGCMonVerbs(training_person,test_person) %>% rename(verb_esp_gcm3_reg = gcm_regular_nof) %>% mutate(participant_id = person_id)

return(results_person)

} 

# esp2

esp2 <- read.csv('~/Work/NZILBB/convergence_esp_2/ESP-bots-vs-humans/ESP2DataOxford.csv') %>% mutate(resp_bot_reg = ifelse(as.character(robotSelects) == as.character(weakPast),T,F))

# head(esp2,1)

# esp2 %>% select(participant_id,peerCondition,regLevel,sensibility,verbStatus) %>% unique %>% group_by(peerCondition,regLevel,sensibility,verbStatus) %>% summarise(n = n())

esp2nonce <- esp2 %>% filter(verbStatus == 'NONCE')

training <- read.csv('~/Work/NZILBB/convergence_esp/baseline_files_1/celex_verbs_with_categories_csv_fixed_moder.txt')

matcher <- read.csv('nonce_verb_matcher.txt') %>% rename(moder = class)

# word,disc,moder,class # expected by GCM funcs
esp2nonce <- esp2nonce %>% rename(word = target)
esp2nonce <- esp2nonce %>% select(-category) %>% merge(matcher)
esp2nonce$phase <- recode(esp2nonce$phase, postTest = 'test2', preTest = 'test1')

# plength <- length(unique(esp2nonce$participant_id))
# person_ress <- as.list(NULL)
# 
# for (i in 1:plength){
# print(i)
# person_id <- unique(esp2nonce$participant_id)[i]
# person_res <- runGuyNoFeature(esp2nonce,training,person_id)  
# person_ress[[i]] <- person_res
# }
# person_ress_df <- do.call('rbind', person_ress)
# save(person_ress_df, file = 'esp2gcm.rda')
load('esp2gcm.rda')
gcm_res <- person_ress_df %>% rename(gcm_reg = verb_esp_gcm3_reg)

test2 <- esp2nonce %>% filter(phase == 'test2')
# test2 %>% select(participant_id,disc)
# person_ress_df %>% select(participant_id,disc)
test2 <- merge(test2,gcm_res)

baseline <- read.csv('~/Work/NZILBB/convergence_esp/esp_paper_essence_2018/esp_paper_baseline_christmas.txt')
baseline <- baseline %>% select(word,celex_gcm_wf,celex_gcm_nof,celex_mgl_nof,celex_mgl_wf) %>% unique

# test2$word %>% unique %>% sort
# baseline$word %>% unique %>% sort
test2b <- merge(baseline,test2)

# write.csv(test2b, file = 'ESP2_nonce_verbs_gcm.txt', row.names=F)


# nope.

# esp3

esp3 <- read.csv('ESP3dat.txt')
esp3nonce <- esp3 %>% filter(verbStatus == 'NONCE')
esp3nonce <- esp3nonce %>% rename(word = target)
esp3nonce <- esp3nonce %>% select(-category) %>% merge(matcher)
esp3nonce$phase <- recode(esp3nonce$phase, postTest = 'test2', preTest = 'test1')
esp3nonce$participant_id <- esp3nonce$subject
esp3nonce$resp_bot_reg <- ifelse(as.character(esp3nonce$robotSelects) == as.character(esp3nonce$weakPast), T, F)
# esp3 %>% select(subject,sensibility,matchCondition,player2Avatar) %>% unique %>% group_by(sensibility,matchCondition,player2Avatar) %>% summarise(n = n())

plength2 <- length(unique(esp3nonce$subject))
person_ress <- as.list(NULL)

for (i in 1:plength2){
print(i)
person_id <- unique(esp3nonce$participant_id)[i]
person_res <- runGuyNoFeature(esp3nonce,training,person_id)  
person_ress[[i]] <- person_res
}
person_ress_df2 <- do.call('rbind', person_ress)
# save(person_ress_df2, file = 'esp3gcm.rda')
load('esp3gcm.rda')
gcm_res2 <- person_ress_df2 %>% rename(gcm_reg = verb_esp_gcm3_reg)

test2b <- esp3nonce %>% filter(phase == 'test2')
# test2 %>% select(participant_id,disc)
# person_ress_df %>% select(participant_id,disc)
test2b <- merge(test2b,gcm_res2)

with(test2b, somers2(gcm_reg,regular)) # C = 0.62

test2b$plays_robot <- ifelse(test2b$player2Avatar == 'laptopR.png', T, F)

fit2 <- glmer(regular ~ gcm_reg * plays_robot + (1 | participant_id), data = test2b, family="binomial", control=glmerControl(optimizer="bobyqa"))

summary(fit2)
